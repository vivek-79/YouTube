
class ApiError extends Error{
    constructor(
        message="Something Went Wrong",
        statusCode,
        errors =[]
    ){
        super(message)
        this.statusCode=statusCode,
        this.errors=errors,
        this.data =null,
        this.message=message,
        this.success=false
    }
}