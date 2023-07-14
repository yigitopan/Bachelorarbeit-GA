import { RequestHandler } from "express";
import { ChromosomController } from "../controller/ChromosomController";
import { TDEEController } from "../controller/TDEEController";
var fs = require('fs');
require('dotenv').config()



export const dataEndpoint:RequestHandler = async(req, res, next) => {
    console.time();

    
    const TDEEC = new TDEEController(Number(process.env.LBM),Number(process.env.AKTIVITAETSNIVEAU))
    
    const taeglicheKalorien = Math.floor(TDEEC.berechneTDEE())

    const CC = new ChromosomController(Number(process.env.LBM), taeglicheKalorien-500) //-500 zur Gewichtsabnahme

    CC.lebenUndLebenLassen(Number(process.env.ANZAHL_DER_INDIVIDUELLEN), Number(process.env.ANZAHL_DER_POPULATION))
    
    const data = CC.getResultate();
    CC.ergebnis()
    console.timeEnd();

    res.status(200).json({data});
}
