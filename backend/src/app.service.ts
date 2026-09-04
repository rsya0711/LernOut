import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRootInfo() {
    return {
      name: 'LearnOut API',
      version: '1.0.0',
      description: 'Interactive Gamified Learning & UTBK Platform',
      status: 'active',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: 'configured',
        auth: 'ready',
      },
    };
  }
}
