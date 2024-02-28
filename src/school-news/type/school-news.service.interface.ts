export const SCHOOL_NEWS_SERVICE = Symbol('SCHOOL_NEWS_SERVICE');

/**
 * 외부 객체에서 학교 소식 서비스를 사용하기 위한 인터페이스 for DIP
 */
export interface SchoolNewsServiceBase {
  /** 소식 생성 */
  create(options: CreateOptions): Promise<CreateResult>;

  /** 소식 수정 */
  update(options: UpdateOptions): Promise<UpdateResult>;

  /** 소식 삭제 */
  delete(options: DeleteOptions): Promise<DeleteResult>;
}

/** 소식 생성 옵션 */
export interface CreateOptions {
  /** 유저 아이디 */
  userId: string;
  /** 학교 아이디 */
  schoolId: string;
  /** 제목 */
  title: string;
  /** 내용 */
  content: string;
}

/** 소식 생성 결과 */
export interface CreateResult {
  /** 소식 ID */
  id: string;
}

/** 소식 수정 옵션 */
export interface UpdateOptions {
  /** 소식 아이디 */
  id: string;
  /** 유저 아아디 */
  userId: string;
  /** 제목 */
  title?: string;
  /** 내용 */
  content?: string;
}

/** 소식 수정 결과 */
export interface UpdateResult {
  /** 소식 ID */
  id: string;
}

/** 소식 삭제 옵션 */
export interface DeleteOptions {
  /** 소식 아이디 */
  id: string;
  /** 유저 아이디 */
  userId: string;
}

/** 소식 삭제 결과 */
export interface DeleteResult {
  /** 소식 ID */
  id: string;
}
