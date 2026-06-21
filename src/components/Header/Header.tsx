import { useLocale } from '../../context/LocaleContext';
import LogoIcon from '../icons/LogoIcon';

const Header = () => {
  const { t } = useLocale();

  return (
    <header className="glass-container gap-2">
      <LogoIcon className="w-10 h-10" />
      <h1 className="text-4xl font-bold text-center">{t('app.title')}</h1>
      <LogoIcon className="w-10 h-10" />
    </header>
  );
};

export default Header;
