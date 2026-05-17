export class AnnouncementDto {
  title!: string;
  message!: string;
  userIds?: number[]; // optionnel
}