import fs from 'fs'
import { erstellenOderAktualiserenGerichteJson } from "../controller/DateiController";
import { lebensmittelliste } from '../controller/DateiController';
require('dotenv').config()


export class TDEEController {
    public readonly aktiviaetsNiveauMultiplikatoren = {
        '1': 1.2,     // Sitzende
        '2': 1.375,   // Geringe Aktivität
        '3':1.55,     // Massig aktiv
        '4':1.725,    // Sehr aktiv
        '5':1.9       // Extrem aktiv
    } as const;

    
    constructor(
        
        public LBM: number, // Bekommen wir LBM und Kalorien in der Konstruktor, um diese Werte in den Funktionen zu nutzen
        public aktivitaetsNiveau: number
        ){
            this.LBM = LBM,
            this.aktivitaetsNiveau = aktivitaetsNiveau
        }
        
    private berechneBMR = (LBM: number) => {
        return ((LBM*21.6)+370); // Katch-McArdle-Formel
    }
    
    berechneTDEE() {
        const BMR = this.berechneBMR(this.LBM);
        console.log(BMR* this.aktiviaetsNiveauMultiplikatoren[this.aktivitaetsNiveau.toString()])
        return BMR* this.aktiviaetsNiveauMultiplikatoren[this.aktivitaetsNiveau.toString()];
    }
}

    






