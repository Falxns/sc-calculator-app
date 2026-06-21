let revision = 0;
const listeners = new Set<() => void>();

export const getIconMigrationRevision = () => revision;

export const subscribeIconMigration = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const notifyIconMigrationComplete = () => {
  revision += 1;
  listeners.forEach((listener) => listener());
};
