export class CalendarSlotDto {
  roomId!: number;
  roomName!: string;
  start!: Date;
  end!: Date;
  available!: boolean;
  title?: string; // event name if occupied
}
