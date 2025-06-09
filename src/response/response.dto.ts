export class ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;

  constructor(data?: T, message = 'Successful', status = true) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
