

export class ApiResponse<T = unknown> {
    status: number;
    message: string;
    data: T | null;
    success: boolean;

    constructor(
        status: number,
        message: string,
        data: T | null = null,
        success: boolean = true
    ) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = success;
    }

    static response<T = unknown>(
        status: number,
        message: string,
        data: T | null = null,
        success: boolean = true
    ): ApiResponse<T> {
        return new ApiResponse<T>(status, message, data, success);
    }
}
