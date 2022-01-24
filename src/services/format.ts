import { t } from '@/i18n/i18n';
import moment from 'moment';

export const toDays = (num: any) => {
  const duration = moment.duration(num * 1000);
  return duration.days() + t('天');
};

export const toSeconds = (num: any) => {
  const duration = moment.duration(num * 1000);
  return (duration.days() * 24 + duration.hours()) + t('时') + duration.minutes() + t('分') + duration.seconds() + t('秒');
};

export default {
  install: (app: any) => {
    app.config.globalProperties.toDays = toDays;
    app.config.globalProperties.toSeconds = toSeconds;
  }
};
