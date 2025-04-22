import { NextResponse } from "next/server";

class Apiresponse {
  public status: number;
  public message: string;
  public data: Record<string, any> | null = null;
  public success: boolean;
  constructor(
    status: number,
    message: string,
    data: Record<string, any> | null = null
  ) {
    this.status = status;
    this.message = message;
    this.success = status < 400;
    this.data = data;
  }
  successResponse() {
    return NextResponse.json(
      { success: this.success, message: this.message, data: this.data },
      { status: this.status }
    );
  }
}

export default Apiresponse;
