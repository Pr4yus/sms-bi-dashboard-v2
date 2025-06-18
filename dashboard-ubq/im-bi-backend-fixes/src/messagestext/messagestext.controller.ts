import { Controller, Get, Query } from '@nestjs/common';
import { MessagestextService } from './messagestext.service';
import { ConfigService } from '@nestjs/config';

@Controller('messagestext')
export class MessagestextController {
  constructor(
    private readonly messagestextService: MessagestextService,
    private readonly configService: ConfigService,
  ) {}

  // Endpoint for Guatemala
  @Get('monthlygt')
  async getMonthlyMessageAnalysisGT(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.messagestextService.getMonthlyMessageAnalysis(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('phrasesgt')
  async getMostUsedPhrasesGT(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.messagestextService.getMostUsedPhrases(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('topwordsgt')
  async getTopWordsGT(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.messagestextService.getMostUsedWords(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  // Endpoint for Costa Rica
  @Get('monthlycr')
  async getMonthlyMessageAnalysisCR(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.messagestextService.getMonthlyMessageAnalysis(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('phrasescr')
  async getMostUsedPhrasesCR(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.messagestextService.getMostUsedPhrases(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('topwordscr')
  async getTopWordsCR(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.messagestextService.getMostUsedWords(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  // Endpoint for El Salvador
  @Get('monthlys')
  async getMonthlyMessageAnalysisSV(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.messagestextService.getMonthlyMessageAnalysis(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('phrasessv')
  async getMostUsedPhrasesSV(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.messagestextService.getMostUsedPhrases(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('topwordssv')
  async getTopWordsSV(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.messagestextService.getMostUsedWords(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  // Similarly for Nicaragua and Honduras
  @Get('monthlyni')
  async getMonthlyMessageAnalysisNI(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.messagestextService.getMonthlyMessageAnalysis(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('phrasesni')
  async getMostUsedPhrasesNI(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.messagestextService.getMostUsedPhrases(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('topwordsni')
  async getTopWordsNI(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.messagestextService.getMostUsedWords(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  // Add for Honduras (CA)
  @Get('monthlyhn')
  async getMonthlyMessageAnalysisHN(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.messagestextService.getMonthlyMessageAnalysis(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('phraseshn')
  async getMostUsedPhrasesHN(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.messagestextService.getMostUsedPhrases(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('topwordshn')
  async getTopWordsHN(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.messagestextService.getMostUsedWords(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  // Add for Honduras (CA)
  @Get('monthlytigohn')
  async getMonthlyMessageAnalysisTigoHN(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.messagestextService.getMonthlyMessageAnalysis(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('phrasestigohn')
  async getMostUsedPhrasesTigoHN(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.messagestextService.getMostUsedPhrases(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('topwordstigohn')
  async getTopWordsTigoHN(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.messagestextService.getMostUsedWords(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('monthlyreach')
  async getMonthlyMessageAnalysisReach(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.messagestextService.getMonthlyMessageAnalysis(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('phrasesreach')
  async getMostUsedPhrasesReach(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.messagestextService.getMostUsedPhrases(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }

  @Get('topwordsreach')
  async getTopWordsReach(
    @Query('accountId') accountId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.messagestextService.getMostUsedWords(
      uri,
      dbName,
      accountId,
      yearMonth,
    );
  }
}
