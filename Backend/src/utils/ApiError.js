
class ApiError extends Error{
    constructor(
        statusCode,
        message="Something Went Wrong",
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

export{ApiError}