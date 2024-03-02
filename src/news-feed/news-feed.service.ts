import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { GetListOptions, GetListResult, NewsFeedServiceBase } from './type/news-feed.service.interface';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { NewsFeedContentType } from '../common/type/common.type';

@Injectable()
export class NewsFeedService implements NewsFeedServiceBase {
  constructor(private readonly prismaRepository: PrismaRepository) {}

  async getList(data: GetListOptions): Promise<GetListResult> {
    const { userId, page, size } = data;

    const whereQuery = { userId, deletedAt: null };
    const list = await this.prismaRepository.newsFeed.findMany({
      where: whereQuery,
      select: {
        id: true,
        contentType: true,
        contentId: true,
        title: true,
        content: true,
        createdAt: true,
      },
      skip: (page - 1) * size,
      take: size,
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.prismaRepository.newsFeed.count({ where: whereQuery });

    return {
      total,
      list: list.map((item) => ({
        id: item.id,
        contentType: NewsFeedContentType[item.contentType],
        contentId: item.contentId,
        title: item.title,
        content: item.content,
        createdAt: DateTime.fromJSDate(item.createdAt, { zone: 'UTC' }).toISO(),
      })),
    };
  }
}
