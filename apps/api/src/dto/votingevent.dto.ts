export enum EventType {
  MESSAGE = 'message',
  VOTE_TIMER = 'timer',
}

export class VotingEvent {
  type!: EventType;
  message!: string;
  startDate?: Date;
  endDate?: Date;
}
