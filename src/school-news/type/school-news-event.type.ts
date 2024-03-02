export const SCHOOL_NEWS_EVENT = {
  SCHOOL_NEWS_CREATE: 'school.news.create',
  SCHOOL_NEWS_UPDATE: 'school.news.update',
  SCHOOL_NEWS_DELETE: 'school.news.delete',
};

/** 생성 이벤트 */
export interface CreateSchoolNewsEventPayload {
  /** 이벤트 타입 */
  eventType: string;

  /** 생성된 소식 아이디 */
  schoolNewsId: string;
}

/** 수정 이벤트 */
export interface UpdateSchoolNewsEventPayload {
  /** 이벤트 타입 */
  eventType: string;

  /** 수정된 소식 아이디 */
  schoolNewsId: string;
}

/** 삭제 이벤트 */
export interface DeleteSchoolNewsEventPayload {
  /** 이벤트 타입 */
  eventType: string;

  /** 삭제된 소식 아이디 */
  schoolNewsId: string;
}
