#include <linux/module.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/mm.h>
#include <linux/sysinfo.h>

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Módulo RAM - Laboratorio Sistemas Operativos 1");
MODULE_AUTHOR("Daniel Estuardo Cuque Ruíz");

static int mostrar_informacion_memoria(struct seq_file *archivo, void *v) {
    struct sysinfo info_sistema;
    si_meminfo(&info_sistema);

    unsigned long total_memoria = info_sistema.totalram * (unsigned long long)info_sistema.mem_unit >> 20;
    unsigned long memoria_libre = info_sistema.freeram * (unsigned long long)info_sistema.mem_unit >> 20;
    unsigned long memoria_utilizada = total_memoria - memoria_libre;
    unsigned int porcentaje_utilizado = (memoria_utilizada * 100) / total_memoria;

    seq_printf(archivo, "{\n");
    seq_printf(archivo, "  \"informacion_memoria\": {\n");
    seq_printf(archivo, "    \"total_memoria\": %lu,\n", total_memoria);
    seq_printf(archivo, "    \"memoria_libre\": %lu,\n", memoria_libre);
    seq_printf(archivo, "    \"memoria_utilizada\": %lu,\n", memoria_utilizada);
    seq_printf(archivo, "    \"porcentaje_utilizado\": %u\n", porcentaje_utilizado);
    seq_printf(archivo, "  }\n");
    seq_printf(archivo, "}\n");

    return 0;
}

static int abrir_archivo(struct inode *inode, struct file *file) {
    return single_open(file, mostrar_informacion_memoria, NULL);
}

static const struct proc_ops operaciones_archivo = {
    .proc_open = abrir_archivo,
    .proc_read = seq_read,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

static int __init cargar_modulo(void) {
    proc_create("ram_so1_1s2024", 0, NULL, &operaciones_archivo);
    printk(KERN_INFO "Módulo RAM cargado exitosamente\n");
    return 0;
}

static void descargar_modulo(void) {
    remove_proc_entry("ram_so1_1s2024", NULL);
    printk(KERN_INFO "Módulo RAM descargado exitosamente\n");
}

module_init(cargar_modulo);
module_exit(descargar_modulo);
