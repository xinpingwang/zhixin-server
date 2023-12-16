declare interface IRestfulResponse<T> {
  status: number
  message: string
  data?: T
}

declare type Nuallable<T> = T | null | undefined
