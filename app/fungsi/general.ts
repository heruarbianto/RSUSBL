import { NextResponse } from "next/server";
// src/index.ts
import { PrismaClient } from "../generated/prisma/client";


 export const prisma = new PrismaClient();

 export const getResponseNotFound =()=>{

  return NextResponse.json(
     {
       metadata: {
         error: 1,
         message: "Data Tidak Ditemukan",
       },
     },{
       status:200
     })
     
   }