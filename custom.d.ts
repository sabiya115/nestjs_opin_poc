declare namespace RAW {
    interface Error {
      errorKey: string;
      path: string;
      errorData?: { [x: string]: any }
    }
}
