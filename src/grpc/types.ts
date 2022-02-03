export type GraphRequest = {
  from: string;
  to: string;
  infos: GraphInfo;
};

export type GraphResponse = {
  message: string;
  data: GraphNode;
};

type GraphInfo = {
  url: string;
  date: number;
};

type GraphNode = {
  id: string;
  from: string;
  to: string;
};
