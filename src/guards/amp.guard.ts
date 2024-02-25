import { SetMetadata } from '@nestjs/common';

export const IS_AMP = 'isAmpRequest';
export const AMPEMAIL = () => SetMetadata(IS_AMP, true);
