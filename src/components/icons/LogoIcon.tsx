interface LogoIconProps {
  className?: string;
}

const LogoIcon = ({ className }: LogoIconProps) => {
  return <img src="/assets/logo.png" alt="Logo" className={className} />;
};

export default LogoIcon;
