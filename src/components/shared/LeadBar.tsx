'use client';

interface LeadBarProps {
  message?: string;
  buttonText?: string;
  onCtaClick: () => void;
}

export default function LeadBar({
  message = 'Get the full 2026 Mobile Growth Strategy Guide',
  buttonText = 'Unlock Full Report',
  onCtaClick,
}: LeadBarProps) {
  return (
    <div className="lead-bar" id="leadBar">
      <p>{message}</p>
      <button className="btn-primary" onClick={onCtaClick}>{buttonText}</button>
    </div>
  );
}
