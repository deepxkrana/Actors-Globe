import React from "react";

interface HeadlineProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  accentColor?: "dune" | "mauve" | "muted" | "white";
  className?: string;
}

export const Headline: React.FC<HeadlineProps> = ({
  text,
  as: Component = "h2",
  accentColor = "white",
  className = ""
}) => {
  const parts = text.split(/(\*[^*]+\*)/g);

  const getAccentClass = () => {
    switch (accentColor) {
      case "dune":
        return "em-dune";
      case "mauve":
        return "em-mauve";
      case "muted":
        return "em-muted";
      case "white":
      default:
        return "em-white";
    }
  };

  return (
    <Component className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("*") && part.endsWith("*")) {
          const content = part.slice(1, -1);
          return (
            <em key={index} className={`em-serif not-italic ${getAccentClass()}`}>
              {content}
            </em>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </Component>
  );
};
