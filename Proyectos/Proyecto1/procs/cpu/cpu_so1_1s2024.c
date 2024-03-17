#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/sched.h>
#include <linux/timekeeping.h>
#include <linux/timer.h>
#include <linux/jiffies.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <asm/uaccess.h>
#include <linux/mm.h>
#include <linux/sched/cputime.h>
#include <linux/timekeeping.h>
#include <linux/time.h>
#include<linux/slab.h>

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Módulo CPU - Laboratorio Sistemas Operativos 1");
MODULE_AUTHOR("Daniel Estuardo Cuque Ruíz");

struct process_info {
    int pid;
    char name[TASK_COMM_LEN];
    unsigned long rss;
    int uid;
    struct list_head children;
};

static struct process_info root;

static void agregar_hijos(struct task_struct *parent, struct process_info *node) {
    struct task_struct *child;
    struct process_info *child_node;

    list_for_each_entry(child, &parent->children, sibling) {
        child_node = kmalloc(sizeof(struct process_info), GFP_KERNEL);
        if (!child_node) {
            printk(KERN_ERR "Error al asignar memoria para child_node\n");
            return;
        }
        INIT_LIST_HEAD(&child_node->children);
        child_node->pid = child->pid;
        strncpy(child_node->name, child->comm, TASK_COMM_LEN - 1);
        child_node->rss = (child->mm) ? (get_mm_rss(child->mm) << PAGE_SHIFT) : 0;
        child_node->uid = from_kuid(&init_user_ns, child->cred->user->uid);
        list_add_tail(&child_node->children, &node->children);
        agregar_hijos(child, child_node);
    }
}

static void inicializar_arbol(void) {
    INIT_LIST_HEAD(&root.children);
    root.pid = 0;
    strncpy(root.name, "root", TASK_COMM_LEN - 1);
    root.rss = 0;
    root.uid = 0;
    agregar_hijos(&init_task, &root);
}

static void imprimir_procesos(struct seq_file *archivo, struct process_info *node, int nivel) {
    struct process_info *child_node;
    list_for_each_entry(child_node, &node->children, children) {
        int i;
        for (i = 0; i < nivel; i++) {
            seq_printf(archivo, "    ");
        }

        seq_printf(archivo, "{\n");
        for (i = 0; i < nivel + 1; i++) {
            seq_printf(archivo, "    ");
        }
        seq_printf(archivo, "\"processId\": %d,\n", child_node->pid);
        for (i = 0; i < nivel + 1; i++) {
            seq_printf(archivo, "    ");
        }
        seq_printf(archivo, "\"PID\": %d,\n", child_node->pid);
        for (i = 0; i < nivel + 1; i++) {
            seq_printf(archivo, "    ");
        }
        seq_printf(archivo, "\"Name\": \"%s\",\n", child_node->name);
        for (i = 0; i < nivel + 1; i++) {
            seq_printf(archivo, "    ");
        }
        seq_printf(archivo, "\"RSS\": %lu,\n", child_node->rss);
        for (i = 0; i < nivel + 1; i++) {
            seq_printf(archivo, "    ");
        }
        seq_printf(archivo, "\"UID\": %d,\n", child_node->uid);
        for (i = 0; i < nivel + 1; i++) {
            seq_printf(archivo, "    ");
        }

        if (!list_empty(&child_node->children)) {
            seq_printf(archivo, "\"children\": [\n");
            imprimir_procesos(archivo, child_node, nivel + 1);
            seq_printf(archivo, "\n");
            for (i = 0; i < nivel + 1; i++) {
                seq_printf(archivo, "    ");
            }
            seq_printf(archivo, "]");
        } else {
            seq_printf(archivo, "\"children\": []");
        }

        seq_printf(archivo, "\n");
        for (i = 0; i < nivel; i++) {
            seq_printf(archivo, "    ");
        }
        seq_printf(archivo, "}");

        if (list_is_last(&child_node->children, &node->children)) {
            seq_printf(archivo, "\n");
        } else {
            seq_printf(archivo, ",\n");
        }
    }
}

static int mostrar_informacion_cpu(struct seq_file *archivo, void *v) {
    inicializar_arbol();
    imprimir_procesos(archivo, &root, 0);
    return 0;
}

static int abrir_archivo(struct inode *inode, struct file *file)
{
    return single_open(file, mostrar_informacion_cpu, NULL);
}

static const struct proc_ops operaciones = {
    .proc_open = abrir_archivo,
    .proc_read = seq_read,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

static int __init cargar_modulo(void)
{
    proc_create("cpu_so1_1s2024", 0, NULL, &operaciones);
    printk(KERN_INFO "Módulo CPU cargado exitosamente\n");
    return 0;
}

static void __exit descargar_modulo(void)
{
    remove_proc_entry("cpu_so1_1s2024", NULL);
    printk(KERN_INFO "Módulo CPU descargado exitosamente\n");
}

module_init(cargar_modulo);
module_exit(descargar_modulo);
