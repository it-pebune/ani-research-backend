
export interface IAppConfig {
  app: {
    title: string;
    description: string;
    keywords: string;
  };
  authentication: {
    private: string;
    public: string;
  }
}

const keyPair = JSON.parse(process.env.AUTH_KEYS || '');

export const appConfig: IAppConfig = {
  app: {
    title: 'Romania / Bune',
    description: 'Romania pe Bune - research backend',
    keywords: 'Romania, pe Bune, ANI, CNA'
  },
  authentication: {
    private: keyPair.private,
    public: keyPair.public
  }
};
