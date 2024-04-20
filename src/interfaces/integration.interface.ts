import { EmailServiceProvider, ReviewPlatformName } from '@prisma/client';
import { EcommerecePlatform } from 'src/enum';

export type Integration = Record<
  EmailServiceProvider | ReviewPlatformName | EcommerecePlatform,
  boolean
>;
