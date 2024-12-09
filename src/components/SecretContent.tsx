interface SecretContentProps {
  content: string;
}

export const SecretContent = ({ content }: SecretContentProps) => (
  <div className="p-4 bg-primary-light rounded-lg">
    <p className="break-all whitespace-pre-wrap text-secondary">{content}</p>
  </div>
);