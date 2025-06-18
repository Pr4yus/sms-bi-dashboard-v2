// dataProvider.ts
import dataProviderNestjsxCrud from "@refinedev/nestjsx-crud";

const API_URL = "http://localhost:3000/";
const dataProvider = dataProviderNestjsxCrud(API_URL);

export default dataProvider;