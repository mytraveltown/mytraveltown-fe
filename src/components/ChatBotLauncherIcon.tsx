import chatBotMascotUrl from "@/assets/chatbot-mascot.png";

interface ChatBotLauncherIconProps {
  className?: string;
}

export function ChatBotLauncherIcon({ className }: ChatBotLauncherIconProps) {
  return (
    <img
      src={chatBotMascotUrl}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      className={`object-contain drop-shadow-lg ${className ?? ""}`}
    />
  );
}
