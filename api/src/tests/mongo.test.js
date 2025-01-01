const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Define un modelo de ejemplo
const UserSchema = new mongoose.Schema({ name: String, age: Number });
const User = mongoose.model('User', UserSchema);

let mongoServer;

beforeAll(async () => {
  // Crear una instancia de MongoDB en memoria
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Conectar Mongoose a MongoDB en memoria
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Cerrar la conexión y detener MongoDB
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Limpiar la base de datos después de cada prueba
  await User.deleteMany({});
});

describe('MongoDB Integration Tests', () => {
  it('should create and find a user', async () => {
    // Crear un usuario
    const user = await User.create({ name: 'John Doe', age: 30 });

    // Buscar al usuario en la base de datos
    const foundUser = await User.findOne({ name: 'John Doe' });

    expect(foundUser.name).toBe(user.name);
    expect(foundUser.age).toBe(user.age);
  });

  it('should update a user', async () => {
    const user = await User.create({ name: 'Jane Doe', age: 25 });

    // Actualizar la edad del usuario
    user.age = 26;
    await user.save();

    const updatedUser = await User.findOne({ name: 'Jane Doe' });
    expect(updatedUser.age).toBe(26);
  });

  it('should delete a user', async () => {
    const user = await User.create({ name: 'John Doe', age: 30 });

    // Eliminar al usuario
    await User.deleteOne({ name: 'John Doe' });

    const deletedUser = await User.findOne({ name: 'John Doe' });
    expect(deletedUser).toBeNull();
  });
});
