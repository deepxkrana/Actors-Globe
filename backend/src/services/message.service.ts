import prisma from "../config/prisma.js";
import { emitToConversation, emitToUser } from "../socket.js";
import type {
  CreateConversationInput,
  SendMessageInput,
  MessageQuery,
  ConversationQuery
} from "../types/message.js";

export const verifyConversationMembership = async (
  userId: string,
  conversationId: string
): Promise<boolean> => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      actor: { select: { userId: true } },
      caster: { select: { userId: true } }
    }
  });

  if (!conversation) {
    return false;
  }

  return (
    conversation.actor.userId === userId ||
    conversation.caster.userId === userId
  );
};

export const getOrCreateConversation = async (
  userId: string,
  data: CreateConversationInput
) => {
  // Determine caller's identity
  const [callerActor, callerCaster] = await Promise.all([
    prisma.actorProfile.findUnique({ where: { userId } }),
    prisma.casterProfile.findUnique({ where: { userId } })
  ]);

  let actorId = "";
  let casterId = "";

  if (callerActor) {
    // Caller is an Actor
    actorId = callerActor.id;

    if (data.casterId) {
      casterId = data.casterId;
    } else if (data.recipientUserId) {
      const recipientCaster = await prisma.casterProfile.findUnique({
        where: { userId: data.recipientUserId }
      });
      if (!recipientCaster) {
        throw new Error("Recipient caster profile not found");
      }
      casterId = recipientCaster.id;
    } else {
      throw new Error("Must provide casterId or recipientUserId for caster");
    }
  } else if (callerCaster) {
    // Caller is a Caster
    casterId = callerCaster.id;

    if (data.actorId) {
      actorId = data.actorId;
    } else if (data.recipientUserId) {
      const recipientActor = await prisma.actorProfile.findUnique({
        where: { userId: data.recipientUserId }
      });
      if (!recipientActor) {
        throw new Error("Recipient actor profile not found");
      }
      actorId = recipientActor.id;
    } else {
      throw new Error("Must provide actorId or recipientUserId for actor");
    }
  } else {
    throw new Error("User must have an active actor or caster profile to start a conversation");
  }

  // Find or create conversation using unique compound key
  let conversation = await prisma.conversation.findUnique({
    where: {
      actorId_casterId: { actorId, casterId }
    },
    include: {
      actor: {
        select: {
          id: true,
          userId: true,
          displayName: true,
          bio: true
        }
      },
      caster: {
        select: {
          id: true,
          userId: true,
          displayName: true,
          bio: true
        }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        actorId,
        casterId
      },
      include: {
        actor: {
          select: {
            id: true,
            userId: true,
            displayName: true,
            bio: true
          }
        },
        caster: {
          select: {
            id: true,
            userId: true,
            displayName: true,
            bio: true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  return {
    id: conversation.id,
    actor: { ...conversation.actor, role: "ACTOR" as const },
    caster: { ...conversation.caster, role: "CASTER" as const },
    lastMessage: conversation.messages[0] || null,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
};

export const getUserConversations = async (
  userId: string,
  query: ConversationQuery
) => {
  const [actorProfile, casterProfile] = await Promise.all([
    prisma.actorProfile.findUnique({ where: { userId } }),
    prisma.casterProfile.findUnique({ where: { userId } })
  ]);

  const orConditions: any[] = [];
  if (actorProfile) orConditions.push({ actorId: actorProfile.id });
  if (casterProfile) orConditions.push({ casterId: casterProfile.id });

  if (orConditions.length === 0) {
    return {
      conversations: [],
      pagination: {
        total: 0,
        page: 1,
        limit: query.limit || 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  const where = { OR: orConditions };
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(50, Math.max(1, query.limit || 10));
  const skip = (page - 1) * limit;

  const [total, conversations] = await Promise.all([
    prisma.conversation.count({ where }),
    prisma.conversation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            userId: true,
            displayName: true,
            bio: true
          }
        },
        caster: {
          select: {
            id: true,
            userId: true,
            displayName: true,
            bio: true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    })
  ]);

  const items = conversations.map((conv: any) => ({
    id: conv.id,
    actor: { ...conv.actor, role: "ACTOR" as const },
    caster: { ...conv.caster, role: "CASTER" as const },
    lastMessage: conv.messages[0] || null,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    conversations: items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

export const getConversationById = async (
  userId: string,
  conversationId: string
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      actor: {
        select: {
          id: true,
          userId: true,
          displayName: true,
          bio: true
        }
      },
      caster: {
        select: {
          id: true,
          userId: true,
          displayName: true,
          bio: true
        }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (
    conversation.actor.userId !== userId &&
    conversation.caster.userId !== userId
  ) {
    throw new Error("Forbidden: You do not belong to this conversation");
  }

  return {
    id: conversation.id,
    actor: { ...conversation.actor, role: "ACTOR" as const },
    caster: { ...conversation.caster, role: "CASTER" as const },
    lastMessage: conversation.messages[0] || null,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
};

export const getConversationMessages = async (
  userId: string,
  conversationId: string,
  query: MessageQuery
) => {
  const isMember = await verifyConversationMembership(userId, conversationId);
  if (!isMember) {
    throw new Error("Forbidden: You do not belong to this conversation");
  }

  const page = Math.max(1, query.page || 1);
  const limit = Math.min(50, Math.max(1, query.limit || 20));
  const skip = (page - 1) * limit;

  const where: any = { conversationId };
  if (query.before) {
    where.createdAt = { lt: new Date(query.before) };
  }

  const [total, messages] = await Promise.all([
    prisma.message.count({ where }),
    prisma.message.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    messages,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

export const sendMessage = async (
  userId: string,
  conversationId: string,
  data: SendMessageInput
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      actor: { include: { user: true } },
      caster: { include: { user: true } }
    }
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (
    conversation.actor.userId !== userId &&
    conversation.caster.userId !== userId
  ) {
    throw new Error("Forbidden: You do not belong to this conversation");
  }

  const recipientUserId =
    conversation.actor.userId === userId
      ? conversation.caster.userId
      : conversation.actor.userId;

  const senderName =
    conversation.actor.userId === userId
      ? conversation.actor.displayName
      : conversation.caster.displayName;

  const message = await prisma.$transaction(async (tx: any) => {
    const msg = await tx.message.create({
      data: {
        conversationId,
        senderId: userId,
        type: data.type || "TEXT",
        content: data.content.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Create notification for recipient
    const snippet =
      data.content.trim().length > 60
        ? `${data.content.trim().substring(0, 57)}...`
        : data.content.trim();

    await tx.notification.create({
      data: {
        userId: recipientUserId,
        type: "NEW_MESSAGE",
        title: `New message from ${senderName}`,
        message: snippet,
        referenceId: conversationId
      }
    });

    return msg;
  });

  // Real-time Socket.IO emission to conversation room and recipient
  emitToConversation(conversationId, "new_message", message);
  emitToUser(recipientUserId, "notification", {
    type: "NEW_MESSAGE",
    title: `New message from ${senderName}`,
    conversationId
  });

  return message;
};
