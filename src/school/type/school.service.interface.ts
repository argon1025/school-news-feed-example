export const SCHOOL_SERVICE = Symbol('SCHOOL_SERVICE');

/**
 * 외부 객체에서 학교 서비스를 사용하기 위한 인터페이스 for DIP
 */
export interface SchoolServiceBase {
  /** 학교 페이지 생성 */
  create(options: CreateOptions): Promise<CreateResult>;
}

/** 학교 페이지 생성 */
export interface CreateOptions {
  /** 유저 아이디 */
  userId: string;
  /** 학교 명 */
  name: string;
  /** 지역 */
  region: SchoolRegionType;
  /** 유저 닉네임 */
  nickname: string;
}

/** 학교 페이지 생성 결과 */
export interface CreateResult {
  /** 학교 ID */
  id: string;
}

/**
 * 학교 멤버 역할
 */
export enum SchoolMemberRoleType {
  /** 선생님 */
  TEACHER = 'TEACHER',
  /** 학생 */
  STUDENT = 'STUDENT',
}

/** 학교 지역 */
export enum SchoolRegionType {
  /** 서울 */
  SEOUL = 'SEOUL',
  /** 부산 */
  BUSAN = 'BUSAN',
  /** 대구 */
  DAEGU = 'DAEGU',
  /** 인천 */
  INCHEON = 'INCHEON',
  /** 광주 */
  GWANGJU = 'GWANGJU',
  /** 대전 */
  DAEJEON = 'DAEJEON',
  /** 울산 */
  ULSAN = 'ULSAN',
  /** 세종 */
  SEJONG = 'SEJONG',
  /** 경기도 */
  GYEONGGIDO = 'GYEONGGIDO',
  /** 강원도 */
  GANGWONDO = 'GANGWONDO',
  /** 충청북도 */
  CHUNGCHEONGBUKDO = 'CHUNGCHEONGBUKDO',
  /** 충청남도 */
  CHUNGCHEONGNAMDO = 'CHUNGCHEONGNAMDO',
  /** 전라북도 */
  JEOLLABUKDO = 'JEOLLABUKDO',
  /** 전라남도 */
  JEOLLANAMDO = 'JEOLLANAMDO',
  /** 경상북도 */
  GYEONGSANGBUKDO = 'GYEONGSANGBUKDO',
  /** 경상남도 */
  GYEONGSANGNAMDO = 'GYEONGSANGNAMDO',
  /** 제주 */
  JEJU = 'JEJU',
}
