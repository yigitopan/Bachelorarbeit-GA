
import fs from 'fs'
import { Nutrient } from '../models/Nutrient';
import { Gericht } from '../models/Gericht';

export const erstellenOderAktualiserenGerichteJson = () => {

    let rawdata = fs.readFileSync('FoodData_Central_survey_food_json_2022-10-28.json');
    let Result = JSON.parse(rawdata.toString());

    const Foods: Gericht[] = [];

    Result.SurveyFoods.forEach((SurveyFood: Gericht) => {
        let protein = SurveyFood.foodNutrients.find((Nutrient: Nutrient) => Nutrient.nutrient.id === 1003).amount;
        let fett = SurveyFood.foodNutrients.find((Nutrient: Nutrient) => Nutrient.nutrient.id === 1004).amount;
        let karb = SurveyFood.foodNutrients.find((Nutrient: Nutrient) => Nutrient.nutrient.id === 1005).amount;
        let kalorien = SurveyFood.foodNutrients.find((Nutrient: Nutrient) => Nutrient.nutrient.id === 1008).amount;

    let food = new Gericht(SurveyFood.description, protein, fett, karb, kalorien);
    Foods.push(food);
    });

    fs.writeFile ("Gerichte.json", JSON.stringify(Foods), function(err) {
        if (err) throw err;
        console.log('complete');
        }
    );
}

export const lebensmittelliste = () => {
    let rawdata = fs.readFileSync('Gerichte.json');
    let Result = JSON.parse(rawdata.toString());
    const Gerichte: Gericht[] = [];

    Result.forEach((element: Gericht) => {
        Gerichte.push(element);
    });

    return Gerichte;
}