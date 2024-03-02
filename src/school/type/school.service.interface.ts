import { SchoolRegionType } from '../../common/type/common.type';

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
