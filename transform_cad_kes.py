import csv
from datetime import datetime

input_file = "public/CAD_KES Historical Data.csv"
output_file = "public/KES_CAD_Transformed_Data.csv"

# Mapping logic
# KES/CAD target format: Date,Currency,Mean,Buy,Sell
# CAD_KES source format: Date,Price,Open,High,Low,Vol.,Change %
# Goal:
# Date: MM/DD/YYYY -> DD/MM/YYYY
# Currency: "KES/CAD"
# Mean: Price
# Buy: Low
# Sell: High

def transform_data():
    with open(input_file, mode='r', encoding='utf-8-sig') as infile, \
         open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
        
        reader = csv.DictReader(infile)
        
        # Define output columns
        fieldnames = ['Date', 'Currency', 'Mean', 'Buy', 'Sell']
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        
        writer.writeheader()
        
        for row in reader:
            # Reformat Date depending on the exact source format
            # Source: 03/10/2026 (assuming MM/DD/YYYY based on the content)
            try:
                date_obj = datetime.strptime(row['Date'], "%m/%d/%Y")
                formatted_date = date_obj.strftime("%d/%m/%Y")
            except ValueError:
                # Fallback if date parsing fails
                formatted_date = row['Date']

            # Extract necessary fields, removing any potential commas from numbers if present
            mean_val = row['Price'].replace(',', '')
            buy_val = row['Low'].replace(',', '')
            sell_val = row['High'].replace(',', '')
            
            # Write transformed row
            writer.writerow({
                'Date': formatted_date,
                'Currency': 'KES/CAD',
                'Mean': mean_val,
                'Buy': buy_val,
                'Sell': sell_val
            })

if __name__ == "__main__":
    print(f"Starting transformation from {input_file} to {output_file}...")
    transform_data()
    print("Transformation completed successfully.")
