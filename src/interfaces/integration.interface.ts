import {
  EmailServiceProvider,
  ReviewPlatformName,
  SMSPlatformName,
} from '@prisma/client';
import { EcommerecePlatform } from 'src/enum';

export type Integration = Record<
  | EmailServiceProvider
  | ReviewPlatformName
  | EcommerecePlatform
  | SMSPlatformName,
  boolean
>;
