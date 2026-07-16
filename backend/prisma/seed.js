import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.sOSAlert.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.sparePartCompatibility.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.serviceCatalog.deleteMany();
  await prisma.mechanicProfile.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const services = [
    { name: 'Standard Oil Change', description: 'Includes up to 5L of synthetic oil and a new filter.', serviceType: 'MECHANICAL', basePrice: 45.0, hourlyLaborRate: 80.0, travelFeePerKm: 2.0 },
    { name: 'Brake Pad Replacement', description: 'Replace front and rear brake pads.', serviceType: 'MECHANICAL', basePrice: 60.0, hourlyLaborRate: 90.0, travelFeePerKm: 2.0 },
    { name: 'Emergency Towing', description: 'Flatbed towing up to 20km.', serviceType: 'TOWING', basePrice: 150.0, hourlyLaborRate: 0.0, travelFeePerKm: 3.5 },
    { name: 'Engine Diagnostic', description: 'Full engine diagnostic scan with report.', serviceType: 'MECHANICAL', basePrice: 85.0, hourlyLaborRate: 95.0, travelFeePerKm: 2.0 },
    { name: 'Spare Parts Order', description: 'Order spare parts for your vehicle.', serviceType: 'SPARE_PARTS', basePrice: 0.0, hourlyLaborRate: 0.0, travelFeePerKm: 0.0 },
  ];

  for (const s of services) {
    await prisma.serviceCatalog.create({ data: s });
  }

  await prisma.sparePart.createMany({
    data: [
      { id: 'synthetic-oil', name: 'Synthetic Oil 5W-30', price: 35.0, installationFee: 15.0, certification: 'API SN' },
      { id: 'ceramic-brake-pads', name: 'Ceramic Brake Pads (Set)', price: 85.0, installationFee: 50.0, certification: 'OEM Grade' },
      { id: 'matrix-led-headlight', name: 'Matrix LED Headlight Unit', price: 1250.0, installationFee: 120.0, certification: 'OEM Grade' },
      { id: 'heavy-duty-shocks', name: 'Heavy Duty Gas Shocks', price: 210.0, installationFee: 60.0, certification: 'Certified' },
      { id: '700cca-battery', name: '700CCA Startup Battery', price: 195.0, installationFee: 25.0, certification: 'Certified' },
      { id: 'full-synthetic-5w30', name: 'Full Synthetic 5W-30 (5L)', price: 72.0, installationFee: 0.0, certification: 'Genuine' },
    ],
  });

  const compatData = [
    { sparePartId: 'ceramic-brake-pads', vehicleMake: 'Toyota', vehicleModel: 'Corolla', yearFrom: 2010, yearTo: 2023 },
    { sparePartId: 'ceramic-brake-pads', vehicleMake: 'BMW', vehicleModel: 'M3', yearFrom: 2015, yearTo: 2024 },
    { sparePartId: 'ceramic-brake-pads', vehicleMake: 'Honda', vehicleModel: 'Civic', yearFrom: 2012, yearTo: 2023 },
    { sparePartId: 'synthetic-oil', vehicleMake: 'Toyota', vehicleModel: 'Corolla', yearFrom: 2008, yearTo: 2024 },
    { sparePartId: 'synthetic-oil', vehicleMake: 'BMW', vehicleModel: 'M3', yearFrom: 2010, yearTo: 2024 },
    { sparePartId: 'synthetic-oil', vehicleMake: 'Ford', vehicleModel: 'Focus', yearFrom: 2010, yearTo: 2023 },
    { sparePartId: 'matrix-led-headlight', vehicleMake: 'BMW', vehicleModel: 'M3', yearFrom: 2020, yearTo: 2024 },
    { sparePartId: 'matrix-led-headlight', vehicleMake: 'Mercedes-Benz', vehicleModel: 'C-Class', yearFrom: 2021, yearTo: 2024 },
    { sparePartId: 'heavy-duty-shocks', vehicleMake: 'Toyota', vehicleModel: 'Hilux', yearFrom: 2015, yearTo: 2024 },
    { sparePartId: 'heavy-duty-shocks', vehicleMake: 'Ford', vehicleModel: 'Ranger', yearFrom: 2015, yearTo: 2024 },
    { sparePartId: '700cca-battery', vehicleMake: 'Toyota', vehicleModel: 'Corolla', yearFrom: 2015, yearTo: 2024 },
    { sparePartId: '700cca-battery', vehicleMake: 'Honda', vehicleModel: 'Civic', yearFrom: 2015, yearTo: 2024 },
    { sparePartId: 'full-synthetic-5w30', vehicleMake: 'Toyota', vehicleModel: 'Corolla', yearFrom: 2008, yearTo: 2024 },
    { sparePartId: 'full-synthetic-5w30', vehicleMake: 'BMW', vehicleModel: 'M3', yearFrom: 2010, yearTo: 2024 },
  ];

  for (const c of compatData) {
    await prisma.sparePartCompatibility.create({ data: c });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: { email: 'admin@onlinegarage.com', name: 'System Admin', role: 'ADMIN', passwordHash, isIdentityVerified: true },
  });

  const user = await prisma.user.create({
    data: { email: 'user@example.com', name: 'John Doe', phone: '1234567890', role: 'USER', passwordHash, isIdentityVerified: true },
  });

  const mechanicUser = await prisma.user.create({
    data: { email: 'mechanic@example.com', name: 'Mike Smith', phone: '0987654321', role: 'MECHANIC', passwordHash, isIdentityVerified: true },
  });

  await prisma.vehicle.create({
    data: { userId: user.id, make: 'Toyota', model: 'Corolla', year: 2018, fuelType: 'PETROL', registrationNumber: 'ABC-123', isPrimary: true },
  });

  await prisma.mechanicProfile.create({
    data: {
      userId: mechanicUser.id,
      specialty: ['Toyota', 'Honda', 'Brakes'],
      bio: 'Over 10 years of experience with Japanese vehicles.',
      yearsOfExperience: 10,
      isReliable: true,
      isIdVerified: true,
      isAvailable: true,
      rating: 4.8,
      totalReviews: 24,
      latitude: 27.7172,
      longitude: 85.3240,
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });