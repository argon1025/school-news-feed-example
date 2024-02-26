import { ConsoleLogger, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class CustomLogger extends ConsoleLogger {
  log(message: string, context?: string) {
    console.log(`[${this.getKstTime()}][${context}] ${message}`);
  }

  error(message: string, error: any, context?: string) {
    console.log(`[${this.getKstTime()}][${context}] ${message}`);

    // 에러 파라미터가 존재하면 에러 로그를 추가로 출력합니다.
    if (error) {
      console.error(error);
    }
  }

  private getKstTime() {
    return DateTime.utc().plus({ hours: 9 }).toISO();
  }
}
