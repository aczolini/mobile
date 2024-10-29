import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, FlatList, TouchableOpacity, Image, Linking } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import CryptoJS from 'crypto-js'
import { BlurView } from 'expo-blur';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  const logout = () => {
    navigation.replace('Login'); 
  };
  return (
    <View style={styles.homeContainer}>
      <Image 
        source={require('./fundo.jpg')} 
        style={styles.imagemFundo} 
        resizeMode="cover"
      />
      <BlurView style={styles.absolute} intensity={10}/>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CadastroAluno')}
        >
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SelecionarAluno')}
        >
          <Text style={styles.buttonText}>Alunos</Text>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <View style={styles.spacer} />
        <View style={styles.spacer} />
        <View style={styles.spacer} />
      </View>
    </View>
  );
};

const CadastroAlunoScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [disponibilidade, setDisponibilidade] = useState('');
  const [preferencias, setPreferencias] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const senha = '';
  const treinos = [];
  const desempenhos = [];

  const salvarCadastro = async () => {
    if (!nome) {
      Alert.alert("Erro", "Por favor, preencha o nome do aluno.");
      return;
    }
    if (!cpf) {
      Alert.alert("Erro", "Por favor, preencha o CPF do aluno.");
      return;
    }

    const novoAluno = {
      nome,
      cpf,
      telefone,
      dataNascimento,
      genero,
      disponibilidade,
      preferencias,
      objetivo,
      senha,
      treinos,
      desempenhos
    };

    try {
      const existeAluno = await AsyncStorage.getItem(cpf);
      
      if (existeAluno) {
        Alert.alert("Erro", "Já existe um aluno cadastrado com este CPF.");
        return;
      }
      
      await AsyncStorage.setItem(cpf, JSON.stringify(novoAluno));
      Alert.alert("Sucesso", `Aluno ${nome} cadastrado!`);
      setNome('');
      setCpf('');
      setTelefone('');
      setDataNascimento('');
      setGenero('');
      setDisponibilidade('');
      setPreferencias('');
      setObjetivo('');

      navigation.navigate('Home');
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o aluno.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
      />
      <TextInput
        style={styles.input}
        placeholder="Data de Nascimento (DD/MM/AAAA)"
        value={dataNascimento}
        onChangeText={setDataNascimento}
      />
      <TextInput
        style={styles.input}
        placeholder="Gênero"
        value={genero}
        onChangeText={setGenero}
      />
      <TextInput
        style={styles.input}
        placeholder="Disponibilidade"
        value={disponibilidade}
        onChangeText={setDisponibilidade}
      />
      <TextInput
        style={styles.input}
        placeholder="Preferências"
        value={preferencias}
        onChangeText={setPreferencias}
      />
      <TextInput
        style={styles.input}
        placeholder="Objetivo Imediato"
        value={objetivo}
        onChangeText={setObjetivo}
      />
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.button} onPress={salvarCadastro}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
};

const SelecionarAlunoScreen = ({ navigation }) => {
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    const carregarAlunos = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const alunosSalvos = await AsyncStorage.multiGet(keys);

        if (alunosSalvos.length > 0) {
          const listaAlunos = alunosSalvos.map(([key, value]) => {
            try {
              return JSON.parse(value);
            } catch {
              return null; 
            }
          }).filter(Boolean); 

          listaAlunos.sort((a, b) => a.nome.localeCompare(b.nome));
          setAlunos(listaAlunos);
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar os alunos.");
      }
    };
    carregarAlunos();
  });

  const alunoSelecionado = (aluno) => {
    navigation.navigate('DetalhesAluno', { aluno });
  };

  const excluirAluno = (aluno) => {
    Alert.alert(
      "Excluir Aluno",
      `Tem certeza que deseja excluir o aluno ${aluno.nome}?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { text: "Excluir", onPress: async () => {
            try {
              await AsyncStorage.removeItem(aluno.cpf);
              Alert.alert("Sucesso", `Aluno ${aluno.nome} excluído!`);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o aluno.");
            }
          }
        }
      ]
    );
  };

  const renderAluno = ({item}) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => alunoSelecionado(item)} style={styles.item}>
        <Text style={styles.itemText}>{item.nome}</Text>
        <Text style={styles.cpfText}>{item.cpf}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => excluirAluno(item)} style={styles.deleteButton}>
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {alunos.length > 0 ? (
        <FlatList
          data={alunos}
          renderItem={renderAluno}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
        />
      ) : (
        <Text style={styles.noDataText}>Nenhum aluno cadastrado.</Text>
      )}
    </View>
  );
};

const DetalhesAlunoScreen = ({ route, navigation }) => {
  const { aluno } = route.params;
  const [nome, setNome] = useState(aluno.nome);
  const [cpf, setCpf] = useState(aluno.cpf);
  const [telefone, setTelefone] = useState(aluno.telefone);
  const [dataNascimento, setDataNascimento] = useState(aluno.dataNascimento);
  const [genero, setGenero] = useState(aluno.genero);
  const [disponibilidade, setDisponibilidade] = useState(aluno.disponibilidade);
  const [preferencias, setPreferencias] = useState(aluno.preferencias);
  const [objetivo, setObjetivo] = useState(aluno.objetivo);
  const senha = aluno.senha;
  const treinos = aluno.treinos;
  const desempenhos = aluno.desempenhos;

  const salvarEdicao = async () => {
    const alunoEditado = { nome, cpf, telefone, dataNascimento, genero, disponibilidade, preferencias, objetivo, senha, treinos, desempenhos };
    try {
        const jsonValue = JSON.stringify(alunoEditado);
        await AsyncStorage.setItem(alunoEditado.cpf, jsonValue);
        Alert.alert("Sucesso", "Aluno atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o aluno.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
      />
      <TextInput
        style={styles.input}
        placeholder="Data de Nascimento"
        value={dataNascimento}
        onChangeText={setDataNascimento}
      />
      <TextInput
        style={styles.input}
        placeholder="Gênero"
        value={genero}
        onChangeText={setGenero}
      />
      <TextInput
        style={styles.input}
        placeholder="Disponibilidade"
        value={disponibilidade}
        onChangeText={setDisponibilidade}
      />
      <TextInput
        style={styles.input}
        placeholder="Preferências"
        value={preferencias}
        onChangeText={setPreferencias}
      />
      <TextInput
        style={styles.input}
        placeholder="Objetivo Imediato"
        value={objetivo}
        onChangeText={setObjetivo}
      />
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.button} onPress={salvarEdicao}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Treinos', { aluno })}>
        <Text style={styles.buttonText}>Treinos</Text>
      </TouchableOpacity>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Desempenhos', { aluno })}>
        <Text style={styles.buttonText}>Desempenhos</Text>
      </TouchableOpacity>
    </View>
  );

};

const TreinosScreen = ({ route}) => {
  const { aluno } = route.params;
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);
  const listaTreinos = aluno.treinos;
  listaTreinos.sort((a, b) => new Date(a.data) - new Date(b.data));
  const [treinos, setTreinos] = useState(listaTreinos);
  

  const excluirTreino = async (item) => {
    Alert.alert(
      "Excluir Treino",
      `Tem certeza que deseja excluir o treino para ${formatDataSelecionada(item.data)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: async () => {

           try{
              aluno.treinos = treinos.filter(treino => treino.data !== item.data);
              await AsyncStorage.setItem(aluno.cpf, JSON.stringify(aluno));
              setTreinos(aluno.treinos);

            } catch(error){
              Alert.alert("Erro", "Não foi possível excluir o treino.");
            }           
          }
        }
      ]
    );
  };

  const adicionarTreino = async () => {

  if (!descricao) {
    Alert.alert("Erro", "Por favor, insira uma descrição do treino.");
    return;
  }

  const novoTreino = { descricao, data };
  const listaDatas = treinos.map(treino => treino.data)
  
  if (listaDatas.includes(novoTreino.data)) {
    Alert.alert(
      "Treino já existe",
      `Já existe um treino para ${formatDataSelecionada(data)}. Deseja substituir?`,
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"),
          style: "cancel"
        },
        {
          text: "Substituir",
          onPress: async () => {
            try{
              const listaTreinos = treinos.filter(treino => treino.data !== novoTreino.data);
              listaTreinos.push(novoTreino);
              aluno.treinos = listaTreinos;
              await AsyncStorage.setItem(aluno.cpf, JSON.stringify(aluno));
              listaTreinos.sort((a, b) => new Date(a.data) - new Date(b.data));
              setTreinos(listaTreinos);

              } catch(error){
                Alert.alert("Erro", "Não foi possível substituir o treino.");
              }
            setDescricao('');           
          }
        }
      ]
    );
  } else {
    
    try{
      const listaTreinos = treinos;
      listaTreinos.push(novoTreino);
      aluno.treinos = listaTreinos;
      await AsyncStorage.setItem(aluno.cpf, JSON.stringify(aluno));
      listaTreinos.sort((a, b) => new Date(a.data) - new Date(b.data));
      setTreinos(listaTreinos);
      } catch(error){
        Alert.alert("Erro", "Não foi possível adicionar o treino.");
      }
    setDescricao('');
  }
};


  const renderTreinos = () => {
    return (
      <FlatList
        data={treinos}
        renderItem={({ item }) => (
          <View style={styles.treinoItem}>
            <Text style={styles.treinoDate}>{formatDataSelecionada(item.data)}</Text>
            <Text style={styles.treinoDescription}>{item.descricao}</Text>
            <TouchableOpacity onPress={() => excluirTreino(item)} style={styles.deleteButton}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  const dayPress = (day) => {
    setData(day.dateString);
    setShowCalendar(false);
  };

  const formatDataSelecionada = (data) => {
    const date = parseISO(data);
    const diaDaSemana = format(date, 'EEEE', { locale: pt });
    const dataFormatada = format(date, 'dd/MM/yyyy');
    return `${diaDaSemana}, ${dataFormatada}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <Text style={styles.alunoNome}>{aluno.nome}</Text>
      <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>{formatDataSelecionada(data)}</Text>
      </TouchableOpacity>

      {showCalendar && (
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={dayPress}
            markedDates={{
              [data]: { selected: true, marked: true, selectedColor: 'blue' }
            }}
          />
        </View>
      )}

      <TextInput
        style={styles.textArea}
        placeholder="Descrição do Treino"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.button} onPress={adicionarTreino}>
        <Text style={styles.buttonText}>Adicionar</Text>
      </TouchableOpacity>
         
      {treinos.length > 0 ? (
      <View style={styles.treinosContainer}>
        {renderTreinos()}
      </View> )
      : null}
    </View>
  );
};

const LoginScreen = ({ navigation }) => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const logar = async () => {

    const senhaHash = CryptoJS.SHA256(senha).toString();

    if (usuario === 'substituir-login-professor' && senhaHash === 'substituir-hashSHA256-da-senha-do-professor') {
      navigation.replace('Home');
      return;
    } 
    try {
      const jsonValue = await AsyncStorage.getItem(usuario);

      if (jsonValue == null) {
        Alert.alert("Erro", "Usuário ou senha incorretos.");
        return;
      }
      aluno = JSON.parse(jsonValue);

      if (!aluno.senha) {
        Alert.alert('Atenção', 'Cadastre uma nova senha.');
        navigation.replace('CadastroSenha', { aluno });
        return;
      }

      if (senhaHash === aluno.senha) {
           navigation.replace('HomeAluno', { aluno });
           return;
      } else {
          Alert.alert('Erro', 'Usuário ou senha incorretos.');
          return;
      }
    } catch (error) {
          Alert.alert('Erro', 'Não foi possível acessar os dados.');
    }
  };


  return (
    <View style={styles.login}>
      <Image 
          source={require('./logo.JPG')}
          style={styles.logo}
          resizeMode="contain"
        />
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={usuario}
        onChangeText={setUsuario}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.button} onPress={logar}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};


const CadastroSenhaScreen = ({ route, navigation }) => {
  const { aluno } = route.params;
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const cadastrarSenha = async () => {
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    aluno.senha = CryptoJS.SHA256(senha).toString();

    try {
      
      await AsyncStorage.setItem(aluno.cpf, JSON.stringify(aluno));
      Alert.alert('Sucesso', 'Senha cadastrada com sucesso!');
      navigation.replace('Login'); 

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a nova senha.');
    }
  };

  return (
    <View style={styles.senhaContainer}>
      <TextInput
        placeholder="Nova Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Confirmar Senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry
        style={styles.input}
      />
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.button} onPress={cadastrarSenha}>
        <Text style={styles.buttonText}>Cadastrar Senha</Text>
      </TouchableOpacity>
    </View>
  );
};

const AlunoTreinosScreen = ({ route, navigation }) => {
  const { aluno } = route.params;
  const treinos = aluno.treinos.sort((a, b) => new Date(a.data) - new Date(b.data));

  const formatDataSelecionada = (data) => {
    const date = parseISO(data);
    const diaDaSemana = format(date, 'EEEE', { locale: pt });
    const dataFormatada = format(date, 'dd/MM/yyyy');
    return `${diaDaSemana}, ${dataFormatada}`;
  };

  const renderTreinos = () => {
    return (
      <FlatList
        data={treinos}
        renderItem={({ item }) => (
          <View style={styles.treinoItem}>
            <Text style={styles.treinoDate}>{formatDataSelecionada(item.data)}</Text>
            <Text style={styles.alunoTreinoText}>{item.descricao}</Text>
            <TouchableOpacity style={styles.clockButton} onPress={() => navigation.navigate('CadastroDesempenho', { treino: item, aluno })}>
              <MaterialIcons name="access-time" size={24} color="orange" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  return (
    <View style={styles.container}>
      {treinos.length > 0 ? (
        <View style={styles.treinosContainer}>
          {renderTreinos()}
         </View>)
      : (
        <Text style={styles.noDataText}>Nenhum treino cadastrado.</Text>)}
    </View>
  );

};

const CadastroDesempenhoScreen = ({ route, navigation }) => {
  const { treino, aluno } = route.params;
  const [horas, setHoras] = useState('');
  const [minutos, setMinutos] = useState('');
  const [km, setKm] = useState('');
  const [pace, setPace] = useState('');
  const treinos = aluno.treinos;
  const desempenhos = aluno.desempenhos;


  const whatsapp = (nome, listaTreinos) => {
    const telefone = 'substituir-telefone-professor';
    const mensagem =  `Olá professor.\n${nome} terminou seu último treino!`;

    if (listaTreinos.length === 0){
      Linking.openURL(`whatsapp://send?text=${mensagem}&phone=${telefone}`);
    }
  };

  const salvarDesempenho = async () => {
    if (!horas || !minutos || !km || !pace) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    
    const novoDesempenho = {
      horas,
      minutos,
      km,
      pace,
      data: treino.data,
      descricao: treino.descricao,
    };


  try {
      desempenhos.push(novoDesempenho);
      aluno.desempenhos = desempenhos;
      const listaTreinos = treinos.filter(item => item.data !== treino.data);
      aluno.treinos = listaTreinos;
      await AsyncStorage.setItem(aluno.cpf, JSON.stringify(aluno));
      Alert.alert('Sucesso', 'Desempenho cadastrado com sucesso!');
      navigation.replace('HomeAluno', { aluno }); 
      whatsapp(aluno.nome, listaTreinos);
    
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o desempenho. ');
    }
  };

  const conversaoKm = (input) => {
    const kmFormatado = input.replace(',', '.');
    setKm(kmFormatado);
  }

  return (
    <View style={styles.container}>
    <View style={styles.spacer} />
      <View style={styles.tempoContainer}>
        <TextInput
          style={styles.tempoInput}
          placeholder="Horas"
          value={horas}
          onChangeText={setHoras}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.tempoInput}
          placeholder="Minutos"
          value={minutos}
          onChangeText={setMinutos}
          keyboardType="numeric"
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Km Total"
        value={km}
        onChangeText={conversaoKm}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Pace"
        value={pace}
        onChangeText={setPace}
        keyboardType="numeric"
      />
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.button} onPress={salvarDesempenho}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
};

const DesempenhosScreen = ({ route }) => {
  const { aluno } = route.params;
  const desempenhos = aluno.desempenhos.sort((a, b) => new Date(b.data) - new Date(a.data));

  const formatDataSelecionada = (data) => {
    const date = parseISO(data);
    const diaDaSemana = format(date, 'EEEE', { locale: pt });
    const dataFormatada = format(date, 'dd/MM/yyyy');
    return `${diaDaSemana}, ${dataFormatada}`;
  };

  const total = () => {
      const listaHoras = desempenhos.map(desempenho => Number(desempenho.horas));
      const listaMinutos = desempenhos.map(desempenho => Number(desempenho.minutos));
      const listaKm = desempenhos.map(desempenho => Number(desempenho.km));
      const somaHoras = listaHoras.reduce((acumulador, valorAtual) => acumulador + valorAtual, 0);
      const somaMinutos = listaMinutos.reduce((acumulador, valorAtual) => acumulador + valorAtual, 0);
      const horasTotal = somaHoras + Math.floor(somaMinutos / 60);
      const minutosTotal = somaMinutos % 60; 
      const kmTotal = listaKm.reduce((acumulador, valorAtual) => acumulador + valorAtual, 0);

    return(
      <View style={styles.total}> 
      <Text style={styles.totalText}> Tempo total: {horasTotal}h {minutosTotal}min </Text>
      <Text style={styles.totalText}> Distância total: {kmTotal}km </Text>
      </View>
    )
  };
  
  const renderDesempenhos = () => {
    return (
      <FlatList
        data={desempenhos}
        renderItem={({ item }) => (
          <View style={styles.desempenhosItem}>
            <Text style={styles.desempenhoDate}>{formatDataSelecionada(item.data)}</Text>
            <Text style={styles.treinoDescription}>{item.descricao}</Text>
            <View style={styles.resultados}>
              <View>
                <Text style={styles.itemResultado}>{item.horas}h {item.minutos}min </Text>
                <Text>Tempo</Text>
              </View>
              <View>
                <Text style={styles.itemResultado}>{item.km}Km</Text>
                <Text>Distância</Text>
              </View>
              <View>
                <Text style={styles.itemResultado}>{item.pace}</Text>
                <Text>Pace</Text>
              </View>
              
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  return (
    <View style={styles.desempenhosContainer}>
      {total()}
      {desempenhos.length > 0 ? (
          renderDesempenhos()
      ) : (
        <Text style={styles.noDataText}>Nenhum desempenho cadastrado.</Text>
      )}
    </View>
  );
};

const UsuarioScreen = ({ route, navigation }) => {
  const { aluno } = route.params;
  const nome = aluno.nome;
  const cpf = aluno.cpf;
  const [telefone, setTelefone] = useState(aluno.telefone);
  const [dataNascimento, setDataNascimento] = useState(aluno.dataNascimento);
  const [genero, setGenero] = useState(aluno.genero);
  const [disponibilidade, setDisponibilidade] = useState(aluno.disponibilidade);
  const [preferencias, setPreferencias] = useState(aluno.preferencias);
  const [objetivo, setObjetivo] = useState(aluno.objetivo);
  const senha = aluno.senha;
  const treinos = aluno.treinos;
  const desempenhos = aluno.desempenhos;

  
  const logout = () => {
    navigation.replace('Login'); 
  };

  const salvarEdicao = async () => {

    const alunoEditado = { nome, cpf, telefone, dataNascimento, genero, disponibilidade, preferencias, objetivo, senha, treinos, desempenhos };
    try {
      await AsyncStorage.setItem(cpf, JSON.stringify(alunoEditado));
      Alert.alert("Sucesso", "Aluno atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o aluno.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        editable={false} 
      />
      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        editable={false} 
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
      />
      <TextInput
        style={styles.input}
        placeholder="Data de Nascimento"
        value={dataNascimento}
        onChangeText={setDataNascimento}
      />
      <TextInput
        style={styles.input}
        placeholder="Gênero"
        value={genero}
        onChangeText={setGenero}
      />
      <TextInput
        style={styles.input}
        placeholder="Disponibilidade"
        value={disponibilidade}
        onChangeText={setDisponibilidade}
      />
      <TextInput
        style={styles.input}
        placeholder="Preferências"
        value={preferencias}
        onChangeText={setPreferencias}
      />
      <TextInput
        style={styles.input}
        placeholder="Objetivo Imediato"
        value={objetivo}
        onChangeText={setObjetivo}
      />
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.button} onPress={salvarEdicao}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.button} onPress= {() => navigation.replace('CadastroSenha', {aluno})}>
        <Text style={styles.buttonText}>Nova Senha</Text>
      </TouchableOpacity>
      <View style={styles.spacer} />
      <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      <View style={styles.spacer} />
    </View>
  );

};

const TabNavigator = ({route}) => {
  const { aluno } = route.params;
  return(
  <Tab.Navigator screenOptions={{
        tabBarShowLabel: false, 
      }}>
    <Tab.Screen name="Treinos" component={AlunoTreinosScreen} initialParams={{ aluno }} options={{
          tabBarIcon: ({focused}) => (
            <MaterialIcons name="directions-run" size={40} color={focused ? '#007BFF' : 'gray'}/>
          ),
        }}/>
    <Tab.Screen name="Desempenhos" component={DesempenhosScreen} initialParams={{ aluno }} options={{
          tabBarIcon: ({focused}) => (
            <MaterialIcons name="access-time" size={40} color={focused ? '#007BFF' : 'gray'}/>
          ),
        }}/>
    <Tab.Screen name="Usuário" component={UsuarioScreen} initialParams={{ aluno }} options={{
          tabBarIcon: ({focused}) => (
            <MaterialIcons name="person" size={40} color={focused ? '#007BFF' : 'gray'}/>
          ),
        }}/>
  </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CadastroSenha" component={CadastroSenhaScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="HomeAluno" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="CadastroAluno" component={CadastroAlunoScreen} options={{ title: 'Cadastrar Aluno' }} />
        <Stack.Screen name="SelecionarAluno" component={SelecionarAlunoScreen} options={{ title: 'Alunos' }} />
        <Stack.Screen 
  name="DetalhesAluno" 
  component={DetalhesAlunoScreen}  
  options={({ navigation }) => ({
    headerTitle: '',
    headerRight: () => (
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginRight: 15 }}>
        <MaterialIcons name="home" size={24} color="#fc7e00" />
      </TouchableOpacity>
    ),
  })}
/>
        <Stack.Screen name="Treinos" component={TreinosScreen} options={({ navigation }) => ({
            headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginRight: 15 }}>
          <MaterialIcons name="home" size={24} color="#fc7e00" />
        </TouchableOpacity>
            ),
          })} />
        <Stack.Screen name="CadastroDesempenho" component={CadastroDesempenhoScreen} options={{ 
            title: 'Desempenho', 
            headerBackTitle: 'Back' 
          }} />
        <Stack.Screen name="Desempenhos" component={DesempenhosScreen}  options={({ navigation }) => ({
            headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginRight: 15 }}>
          <MaterialIcons name="home" size={24} color="#fc7e00" />
        </TouchableOpacity>
            ),
          })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f5f5f5',

  },
  homeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 300,
    height: 200,
    marginTop: 100, 
    marginBottom: 20,
  },
  login: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  imagemFundo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    width: '80%',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 70,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    width: '80%',
    borderRadius: 5,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  logoutButton: {
    backgroundColor: '#fc7e00',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
  },
  itemText: {
    fontSize: 16,
  },
  cpfText: {
    marginTop: 10,
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 5,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  clockButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 5,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  senhaContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    marginTop: 10
  },
  list: {
    width: '100%',
    marginTop: 20,
    },
  noDataText: {
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  spacer: {
    height: 20,
  },
  alunoNome: {
    fontSize: 24,
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  dateText: {
    color: 'black',
    fontSize: 16,
  },
  calendarContainer: {
    position: 'absolute',
    top: 100, 
    left: 0,
    right: 0,
    zIndex: 10,
  },
  treinoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff', 
    borderRadius: 5, 
    marginBottom: 10, 
  },
  treinoDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  treinoDescription: {
    fontSize: 14,
    color: '#333',
  },
  alunoTreinoText: {
    fontSize: 16,
    color: '#333',
  },
  treinosContainer: {
    marginTop: 20,
    width: '80%',
  },
  desempenhosContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    width: '100%',
  },
  desempenhosItem: {
    backgroundColor: '#fff',
    paddingRight: 10,
    paddingLeft: 10,
    paddingVertical: 20,
    width: 350, 
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 5,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'left',
    alignSelf: 'center'
  },
  desempenhoDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5, 
  },
  tempoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tempoInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    width: '40%',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  total: {
    backgroundColor: '#fc7e00',
    paddingRight: 10,
    paddingLeft: 10,
    paddingVertical: 10,
    width: 350,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginTop: 5,
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'left',
    alignSelf: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    marginTop: 5,
  },
  resultados: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  itemResultado: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF',
    paddingRight: 40,
    alignSelf: 'left',
  },
});
