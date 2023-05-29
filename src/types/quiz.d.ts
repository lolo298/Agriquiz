declare interface Question {
  question: string;
  explication: string;
  possible: (string | null)[];
  res: number;
}
declare interface DataDB {
  [key: string]: Question;
}

declare interface DataChart {
  key: string;
  id: number;
  value: number;
}
