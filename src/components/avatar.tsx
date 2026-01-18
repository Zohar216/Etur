import { cn } from "@/lib/utils";

type AvatarProps = {
  name?: string | null;
  email?: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const getInitials = (name?: string | null, email?: string) => {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  }
  if (email) {
    return email[0]?.toUpperCase() || "?";
  }
  return "?";
};

const getColorForUser = (identifier: string): string => {
  // Generate a consistent color based on the identifier
  const colors = [
    "from-blue-600 to-blue-800",
    "from-purple-600 to-purple-800",
    "from-pink-600 to-pink-800",
    "from-red-600 to-red-800",
    "from-orange-600 to-orange-800",
    "from-amber-600 to-amber-800",
    "from-green-600 to-green-800",
    "from-teal-600 to-teal-800",
    "from-cyan-600 to-cyan-800",
    "from-indigo-600 to-indigo-800",
    "from-violet-600 to-violet-800",
    "from-fuchsia-600 to-fuchsia-800",
  ];

  // Create a hash from the identifier
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to select a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export const Avatar = ({
  name,
  email,
  image,
  size = "sm",
  className,
}: AvatarProps) => {
  const initials = getInitials(name, email);
  const sizeClass = sizeClasses[size];
  const identifier = email || name || "default";
  const colorGradient = getColorForUser(identifier);

  if (image) {
    return (
      <img
        src={image}
        alt={name || email || "User"}
        className={cn(
          "rounded-full object-cover",
          sizeClass,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        `flex items-center justify-center rounded-full bg-gradient-to-br ${colorGradient} font-medium text-white`,
        sizeClass,
        className,
      )}
    >
      {initials}
    </div>
  );
};
