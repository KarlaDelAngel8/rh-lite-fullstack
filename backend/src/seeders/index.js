import sequelize from '../config/database.js';
import { Area, Branch, Department, CandidateState } from '../models/index.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seeder...');

    // Sincronizar base de datos
    console.log('📝 Sincronizando tablas...');
    await sequelize.sync({ alter: true, force: false });
    console.log('✅ Tablas sincronizadas');

    // Verificar si ya existen datos
    const areaCount = await Area.count();
    if (areaCount > 0) {
      console.log(`📊 Base de datos ya contiene ${areaCount} áreas. Seeder completado.`);
      process.exit(0);
    }

    console.log('📥 Insertando datos de ejemplo...\n');

    // Crear Áreas (uno por uno)
    const area1 = await Area.create({
      name: 'Estructura Organizacional',
      description: 'Departamentos y unidades de negocio',
      status: true,
    });
    console.log('✅ Área 1 creada:', area1.name);

    const area2 = await Area.create({
      name: 'Recursos Humanos',
      description: 'Gestión de recursos y nómina',
      status: true,
    });
    console.log('✅ Área 2 creada:', area2.name);

    const area3 = await Area.create({
      name: 'Tecnología',
      description: 'Desarrollo e infraestructura',
      status: true,
    });
    console.log('✅ Área 3 creada:', area3.name);

    const area4 = await Area.create({
      name: 'Operaciones',
      description: 'Procesos operacionales',
      status: true,
    });
    console.log('✅ Área 4 creada:', area4.name);

    // Crear Sucursales
    const branch1 = await Branch.create({
      name: 'Sucursal Central',
      description: 'Oficina principal en la ciudad',
      areaId: area1.id,
      status: true,
    });
    console.log('✅ Sucursal 1 creada:', branch1.name);

    const branch2 = await Branch.create({
      name: 'Sucursal Norte',
      description: 'Oficina del norte',
      areaId: area1.id,
      status: true,
    });
    console.log('✅ Sucursal 2 creada:', branch2.name);

    const branch3 = await Branch.create({
      name: 'Sucursal Sur',
      description: 'Oficina del sur',
      areaId: area2.id,
      status: true,
    });
    console.log('✅ Sucursal 3 creada:', branch3.name);

    const branch4 = await Branch.create({
      name: 'Centro de Datos',
      description: 'Infraestructura tecnológica',
      areaId: area3.id,
      status: true,
    });
    console.log('✅ Sucursal 4 creada:', branch4.name);

    // Crear Departamentos
    await Department.create({
      name: 'Dirección General',
      description: 'Dirección ejecutiva',
      status: true,
    });
    console.log('✅ Departamento 1 creado');

    await Department.create({
      name: 'Gestión de Personal',
      description: 'Selección y desarrollo',
      status: true,
    });
    console.log('✅ Departamento 2 creado');

    await Department.create({
      name: 'Desarrollo',
      description: 'Equipo de desarrollo',
      status: true,
    });
    console.log('✅ Departamento 3 creado');

    await Department.create({
      name: 'Soporte',
      description: 'Soporte técnico',
      status: true,
    });
    console.log('✅ Departamento 4 creado');

    await Department.create({
      name: 'Operaciones',
      description: 'Equipo operacional',
      status: true,
    });
    console.log('✅ Departamento 5 creado');

    // Crear Estados de Candidato
    await CandidateState.create({
      name: 'Nuevo',
      description: 'Candidato recién ingresado',
      status: true,
    });
    console.log('✅ Estado 1 creado');

    await CandidateState.create({
      name: 'En Evaluación',
      description: 'Candidato en proceso de evaluación',
      status: true,
    });
    console.log('✅ Estado 2 creado');

    await CandidateState.create({
      name: 'Preseleccionado',
      description: 'Candidato preseleccionado',
      status: true,
    });
    console.log('✅ Estado 3 creado');

    await CandidateState.create({
      name: 'En Entrevista',
      description: 'Candidato en proceso de entrevista',
      status: true,
    });
    console.log('✅ Estado 4 creado');

    await CandidateState.create({
      name: 'Oferta Realizada',
      description: 'Se ha realizado oferta de trabajo',
      status: true,
    });
    console.log('✅ Estado 5 creado');

    await CandidateState.create({
      name: 'Rechazado',
      description: 'Candidato rechazado',
      status: false,
    });
    console.log('✅ Estado 6 creado');

    console.log('\n🎉 Seeder completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seeder:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Ejecutar seeder
seedDatabase();
