
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../supabase';

type Registro = {
  id: string;
  nombre: string;
  descripcion: string;
  created_at: string;
};

export default function HomeScreen() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarRegistros();
  }, []);

  // READ: consultar registros
  async function cargarRegistros() {
    setCargando(true);

    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistros((data ?? []) as Registro[]);
    } catch (error: any) {
      console.log('ERROR AL CONSULTAR:', error);
      Alert.alert(
        'Error al consultar',
        error?.message || JSON.stringify(error)
      );
    } finally {
      setCargando(false);
    }
  }

  // CREATE y UPDATE
  async function guardarRegistro() {
    if (!nombre.trim()) {
      Alert.alert('Atención', 'Escribe un nombre.');
      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        const { error } = await supabase
          .from('registros')
          .update({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
          })
          .eq('id', editando);

        if (error) throw error;

        Alert.alert('Correcto', 'Registro actualizado.');
      } else {
        const { error } = await supabase
          .from('registros')
          .insert({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
          });

        if (error) throw error;

        Alert.alert('Correcto', 'Registro creado.');
      }

      setNombre('');
      setDescripcion('');
      setEditando(null);

      await cargarRegistros();
    } catch (error: any) {
      console.log('ERROR COMPLETO DE SUPABASE:', error);

      Alert.alert(
        'Error al guardar',
        error?.message || JSON.stringify(error)
      );
    } finally {
      setGuardando(false);
    }
  }

  // Preparar edición
  function prepararEdicion(registro: Registro) {
    setNombre(registro.nombre);
    setDescripcion(registro.descripcion);
    setEditando(registro.id);
  }

  // DELETE
  async function eliminarRegistro(id: string) {
    try {
      const { error } = await supabase
        .from('registros')
        .delete()
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Correcto', 'Registro eliminado.');
      await cargarRegistros();
    } catch (error: any) {
      console.log('ERROR AL ELIMINAR:', error);
      Alert.alert(
        'Error al eliminar',
        error?.message || JSON.stringify(error)
      );
    }
  }

  function confirmarEliminacion(id: string) {
    Alert.alert(
      'Eliminar registro',
      '¿Estás seguro de que deseas eliminarlo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void eliminarRegistro(id);
          },
        },
      ]
    );
  }

  function cancelarEdicion() {
    setNombre('');
    setDescripcion('');
    setEditando(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>Mi CRUD Móvil</Text>
          <Text style={styles.subtitulo}>
            Administrador de registros con Supabase
          </Text>
        </View>

        <View style={styles.formulario}>
          <Text style={styles.tituloFormulario}>
            {editando ? 'Editar registro' : 'Nuevo registro'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
          />

          <TextInput
            style={[styles.input, styles.inputDescripcion]}
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
          />

          <TouchableOpacity
            style={styles.botonGuardar}
            onPress={guardarRegistro}
            disabled={guardando}
          >
            <Text style={styles.textoBoton}>
              {guardando
                ? 'Guardando...'
                : editando
                  ? 'Actualizar registro'
                  : 'Agregar registro'}
            </Text>
          </TouchableOpacity>

          {editando && (
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={cancelarEdicion}
            >
              <Text style={styles.textoCancelar}>Cancelar edición</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.seccionLista}>
          <View style={styles.encabezadoLista}>
            <Text style={styles.tituloLista}>
              Mis registros ({registros.length})
            </Text>

            <TouchableOpacity onPress={cargarRegistros}>
              <Text style={styles.actualizar}>Actualizar</Text>
            </TouchableOpacity>
          </View>

          {cargando ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : (
            <FlatList
              data={registros}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.lista}
              ListEmptyComponent={
                <Text style={styles.vacio}>
                  Todavía no tienes registros. ¡Agrega el primero!
                </Text>
              }
              renderItem={({ item }) => (
                <View style={styles.tarjeta}>
                  <Text style={styles.nombreRegistro}>
                    {item.nombre}
                  </Text>

                  <Text style={styles.descripcionRegistro}>
                    {item.descripcion || 'Sin descripción'}
                  </Text>

                  <View style={styles.botonesFila}>
                    <TouchableOpacity
                      style={styles.botonEditar}
                      onPress={() => prepararEdicion(item)}
                    >
                      <Text style={styles.textoBotonPequeno}>
                        Editar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.botonEliminar}
                      onPress={() => confirmarEliminacion(item.id)}
                    >
                      <Text style={styles.textoBotonPequeno}>
                        Eliminar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#1d4ed8',
    padding: 24,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitulo: {
    color: '#dbeafe',
    marginTop: 5,
  },
  formulario: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 18,
    borderRadius: 14,
    elevation: 3,
  },
  tituloFormulario: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 9,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  inputDescripcion: {
    minHeight: 75,
    textAlignVertical: 'top',
  },
  botonGuardar: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botonCancelar: {
    padding: 12,
    alignItems: 'center',
  },
  textoCancelar: {
    color: '#64748b',
  },
  seccionLista: {
    flex: 1,
    paddingHorizontal: 16,
  },
  encabezadoLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tituloLista: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  actualizar: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  lista: {
    paddingBottom: 30,
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  nombreRegistro: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  descripcionRegistro: {
    color: '#64748b',
    marginTop: 6,
    marginBottom: 14,
  },
  botonesFila: {
    flexDirection: 'row',
    gap: 10,
  },
  botonEditar: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 7,
    flex: 1,
    alignItems: 'center',
  },
  botonEliminar: {
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 7,
    flex: 1,
    alignItems: 'center',
  },
  textoBotonPequeno: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  vacio: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 30,
    fontSize: 15,
  },
});
