// Custom Error Class agar kita bisa melempar status HTTP dan kode spesifik

export class AppError extends Error {
    public statusCode: number
    public errorCode?: string
    constructor(statusCode: number, message: string, errorCode?: string) {
        super(message)
        this.statusCode = statusCode
        this.errorCode = errorCode
        // Menjaga stack trace (penting untuk debugging)
        Error.captureStackTrace(this, this.constructor)
    }
}