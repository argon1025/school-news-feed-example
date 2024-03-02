export const SCHOOL_EVENT = {
  SCHOOL_CREATE: 'school.create',
};

export interface CreateSchoolEventPayload {
  /** 이벤트 타입 */
  eventType: string;
  /** 생성한 유저 아이디 */
  userId: string;
  /** 생성된 학교 아이디 */
  schoolId: string;
  /** 유저 닉네임 */
  nickname: string;
}
