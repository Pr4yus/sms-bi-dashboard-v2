/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { MongoService } from '../mongo/mongo.service'; // Ajusta la ruta si es necesario
import { ObjectId } from 'mongodb'; // Importa ObjectId

@Injectable()
export class MessagestextService {
  constructor(private readonly mongoService: MongoService) {}

  // Función auxiliar para obtener el último día del mes
  private getLastDayOfMonth(yearMonth: string): Date {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0); // El mes es 1-based en este constructor
  }

  // Función para calcular la distancia de Levenshtein
  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
      Array(b.length + 1).fill(0),
    );

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // eliminación
          matrix[i][j - 1] + 1, // inserción
          matrix[i - 1][j - 1] + cost, // sustitución
        );
      }
    }

    return matrix[a.length][b.length];
  }

  // Función para calcular la similitud en porcentaje
  private similarityPercentage(a: string, b: string): number {
    const distance = this.levenshteinDistance(a, b); // Usar `this` para acceder al método
    return (1 - distance / Math.max(a.length, b.length)) * 100;
  }

  // Análisis mensual de mensajes para las frases más usadas
  async getMonthlyMessageAnalysis(
    uri: string,
    dbName: string,
    accountId: string,
    yearMonth: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const startDate = new Date(`${yearMonth}-01T00:00:00Z`);
    const endDate = this.getLastDayOfMonth(yearMonth);

    const query = {
      account_uid: new ObjectId(accountId),
      datetime: {
        $gte: startDate,
        $lt: new Date(endDate.getTime() + 24 * 60 * 60 * 1000),
      },
      direction: 'OUT',
      channel_type: 'SMS',
    };

    return db
      .collection('transactions')
      .aggregate(
        [
          { $match: query },
          {
            $group: {
              _id: '$content', // Agrupar por contenido completo del mensaje
              count: { $sum: 1 }, // Contar ocurrencias de cada frase
            },
          },
          { $sort: { count: -1 } }, // Ordenar por las frases más usadas
          { $limit: 5 }, // Limitar a las 5 frases más usadas
        ],
        { allowDiskUse: true },
      )
      .toArray();
  }

  // Método para obtener las frases más usadas basadas en un subconjunto
  async getMostUsedPhrases(
    uri: string,
    dbName: string,
    accountId: string,
    yearMonth: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const startDate = new Date(`${yearMonth}-01T00:00:00Z`);
    const endDate = this.getLastDayOfMonth(yearMonth);

    const query = {
      account_uid: new ObjectId(accountId),
      datetime: {
        $gte: startDate,
        $lt: new Date(endDate.getTime() + 24 * 60 * 60 * 1000),
      },
      direction: 'OUT',
      channel_type: 'SMS',
    };

    const transactions = await db
      .collection('transactions')
      .find(query)
      .project({ content: 1 })
      .limit(100000)
      .toArray();

    const phraseCounts: { [phrase: string]: number } = {};
    const minPhraseLength = 7;

    transactions.forEach((txn) => {
      const words = txn.content.split(/\s+/);

      // Iterar sobre las frases de longitud >= minPhraseLength
      for (let i = 0; i <= words.length - minPhraseLength; i++) {
        const phrase = words
          .slice(i, i + minPhraseLength)
          .join(' ')
          .toLowerCase()
          .trim();

        if (phrase) {
          phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
        }
      }
    });

    // Ordenar las frases por frecuencia
    let sortedPhrases = Object.entries(phraseCounts).sort(
      ([, a], [, b]) => b - a,
    );

    // Filtrar frases redundantes por similitud de caracteres
    const filteredPhrases: { phrase: string; count: number }[] = [];

    const similarityThreshold = 20; // Umbral de similitud en porcentaje

    sortedPhrases.forEach(([phraseA, countA]) => {
      let isRedundant = false;

      for (let j = 0; j < filteredPhrases.length; j++) {
        const phraseB = filteredPhrases[j].phrase;

        const similarity = this.similarityPercentage(phraseA, phraseB); // Usar el método `similarityPercentage`
        if (similarity >= similarityThreshold) {
          isRedundant = true;
          break;
        }
      }

      if (!isRedundant) {
        filteredPhrases.push({ phrase: phraseA, count: countA });
      }

      if (filteredPhrases.length >= 10) return; // Limitar a las top 10 frases después del filtrado
    });

    return filteredPhrases.slice(0, 15); // Devolver solo las 10 frases principales
  }

  // Método para obtener las palabras más usadas
  async getMostUsedWords(
    uri: string,
    dbName: string,
    accountId: string,
    yearMonth: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const startDate = new Date(`${yearMonth}-01T00:00:00Z`);
    const endDate = this.getLastDayOfMonth(yearMonth);

    const query = {
      account_uid: new ObjectId(accountId),
      datetime: {
        $gte: startDate,
        $lt: new Date(endDate.getTime() + 24 * 60 * 60 * 1000),
      },
      direction: 'OUT',
      channel_type: 'SMS',
      conversation_uid: { $exists: false }, // Asegura que el campo conversation_uid no exista
    };
    const transactions = await db
      .collection('transactions')
      .find(query)
      .project({ content: 1 })
      .limit(100000)
      .toArray();

    const wordCounts: { [key: string]: number } = {};

    transactions.forEach((txn) => {
      const words = txn.content.split(/\s+/);
      words.forEach((word) => {
        const cleanWord = word.trim().toLowerCase();
        if (cleanWord) {
          wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
        }
      });
    });

    const sortedWords = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 25);

    console.log('Palabras Más Usadas:', sortedWords);

    return sortedWords.map(([word, count]) => ({ word, count }));
  }
}
