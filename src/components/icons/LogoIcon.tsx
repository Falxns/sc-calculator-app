interface LogoIconProps {
  className?: string;
}

const LogoIcon = ({ className }: LogoIconProps) => {
  return (
    <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="Logo" className={className} />
  );
};

export default LogoIcon;
