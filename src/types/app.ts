import { ConfigModule } from '@medusajs/medusa'

export type AppConfigModule = ConfigModule & {
  projectConfig: {
    senderName?: string
    emailTemplates: Record<string, string>
  }
}
