import { UserRoleType } from '../../common/type/common.type';

export const USER_SERVICE = Symbol('USER_SERVICE');

/**
 * 외부 객체에서 유저 서비스를 사용하기 위한 인터페이스 for DIP
 */
export interface UserServiceBase {
  /** 유저 생성 */
  create(options: CreateOptions): Promise<CreateResult>;

  /** 유저 조회 */
  findOne(options: FindOneOptions): Promise<FindOneResult>;
}

/** 유저 생성 옵션 */
export interface CreateOptions {
  /** 이름 */
  name: string;
  /** 유저 역할 */
  role: UserRoleType;
}

/** 유저 생성 결과 */
export interface CreateResult {
  /** 유저 ID */
  id: string;
}

/** 유저 조회 */
export interface FindOneOptions {
  /** 유저 ID */
  id: string;
}

/** 유저 조회 결과 */
export interface FindOneResult {
  /** 유저 ID */
  id: string;
  /** 이름 */
  name: string;
  /** 유저 역할 */
  role: UserRoleType;
}
