import { NewsFeedContentType } from '../../common/type/common.type';

export const NEWS_FEED_SERVICE = Symbol('NEWS_FEED_SERVICE');

export interface NewsFeedServiceBase {
  /** 뉴스 피드 조회 */
  getList(data: GetListOptions): Promise<GetListResult>;
}

/** 유저 뉴스 피드 조회 */
export interface GetListOptions {
  userId: string;
  page: number;
  size: number;
}

/** 유저 뉴스 피드 조회 결과 */
export interface GetListResult {
  list: {
    /** 뉴스 피드 아이디 */
    id: string;
    /** 콘텐츠 타입 */
    contentType: NewsFeedContentType;
    /** 콘텐츠 아이디 */
    contentId: string;
    /** 콘텐츠 제목 */
    title: string;
    /** 콘텐츠 내용 */
    content: string;
    /** 콘텐츠 이미지 */
    createdAt: string;
  }[];
  total: number;
}
